using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using GradePortalAPI.Dtos;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models;
using GradePortalAPI.Models.Base;
using GradePortalAPI.Models.Errors;
using GradePortalAPI.Models.Interfaces;
using GradePortalAPI.Models.Interfaces.Base;
using GradePortalAPI.Services.Repositories;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;

namespace GradePortalAPI.Services
{
    public class UserService : BaseRepository<User>, IUserService
    {
        private readonly DataContext _context;

        public UserService(DataContext context) : base(context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        /// <inheritdoc />
        public async Task<IResult<User>> Authenticate(string username, string password)
        {
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
                return new Result<User>(message: "Username or password is empty", isSuccess: false, data: null);


            var user = await _context.Users.SingleOrDefaultAsync(x => x.Username == username);

            if (user == null || !VerifyPasswordHash(password, user.PasswordHash, user.PasswordSalt))
                return new Result<User>(message: "Username or password is incorrect. Try login again.", isSuccess: false, data: null);

            return new Result<User>(message: "Authenticate successful!", isSuccess: true, data: user);
        }

        /// <inheritdoc />
        public async Task<IResult> Create(User user, string password)
        {
            if (string.IsNullOrWhiteSpace(password))
                return new Result(message: "Password is empty!", isSuccess: false);

            if (_context.Users.Any(x => x.Username == user.Username))
                return new Result(message: "Username has already created!", isSuccess: false);

            CreatePasswordHash(password, out var passwordHash, out var passwordSalt);
            if (passwordHash == null || passwordSalt == null)
                throw new AppException(message: "Can create password hash");

            user.PasswordSalt = passwordSalt;
            user.PasswordHash = passwordHash;

            user.QuickSearchName = user.FirstName.ToUpperInvariant() + user.LastName.ToUpperInvariant() +
                                   user.FirstName.ToUpperInvariant();
            user.QuickSearchCity = user.City.ToUpperInvariant();
            user.QuickSearchPosition = user.Position.ToUpperInvariant();

            var a = _context.Users.Add(user);
            if(a == null)
                throw new AppException(message:"Can't create user");

            await _context.SaveChangesAsync();

            return new Result(message: "Created successful!", isSuccess: true);
        }

        /// <inheritdoc />
        public async Task<IResult<IList<User>>> GetUsersWithParams(TableParamsDto tableParams)
        {
            var users = await GetAll().Skip(tableParams.Skip()).Take(tableParams.Take()).ToListAsync();
            if(users == null)
                throw new AppException(message: "Internal Error: can't get users with params: "+tableParams.Page+ " "+tableParams.PageSize);
            return new Result<IList<User>>(message: "Success", isSuccess: true, data: users);
        }

        /// <inheritdoc />
        public User GetById(string id)
        {
            return _context.Users.Find(id);
        }

        /// <inheritdoc />
        public async Task<IResult<User>> GetByUserName(string username)
        {
            if (username == null)
                return new Result<User>(message: "Username is empty. Print username and try again", isSuccess: false, data:null);

            var res = await _context.Users.SingleOrDefaultAsync(r => r.Username == username);
            if(res == null)
                return new Result<User>(message: "Can't find user with username: "+username, isSuccess: false, data: null);

            return new Result<User>(message: "Success", isSuccess: true, data: res);
        }

        /// <inheritdoc />
        public IResult Update(string id, User user, string password = null)
        {
            if (id != user.Id)
                return new Result(message: "User try update another profile! User id: "+id+", profile id:"+user.Id, isSuccess: false);

            var currentUser = _context.Users.Find(user.Id);

            if (currentUser == null)
                return new Result(message: "User not found", isSuccess: false);

            if (user.Username != currentUser.Username && _context.Users.Any(x => x.Username == user.Username))
                return new Result(message: "Username has already existed. Username:", isSuccess: false);

            // проверка полей у user

            currentUser.FirstName = user.FirstName;
            currentUser.LastName = user.LastName;
            currentUser.Username = user.Username;
            currentUser.City = user.City;
            currentUser.Position = user.Position;
            
            currentUser.QuickSearchName = 
                user.FirstName.ToUpperInvariant() + user.LastName.ToUpperInvariant() + user.FirstName.ToUpperInvariant();
            currentUser.QuickSearchCity = user.City.ToUpperInvariant();
            currentUser.QuickSearchPosition = user.Position.ToUpperInvariant();

            if (!string.IsNullOrWhiteSpace(password))
            {
                byte[] passwordHash, passwordSalt;
                CreatePasswordHash(password, out passwordHash, out passwordSalt);

                currentUser.PasswordHash = passwordHash;
                currentUser.PasswordSalt = passwordSalt;
            }

            _context.Users.Update(currentUser);
            _context.SaveChanges();
            return new Result("Update successful!", true);
        }

        /// <inheritdoc />
        public int CountAllUsers()
        {
            return _context.Users.Count();
        }

        /// <inheritdoc />
        public IQueryable<User> GetAll()
        {
            return _context.Users.AsQueryable();
        }

        private static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            if (password == null)
                throw new ArgumentNullException("password");
            if (string.IsNullOrWhiteSpace(password)) throw new ArgumentException("Value is empty", "password");

            var hmac = new HMACSHA512();
            passwordSalt = hmac.Key;
            passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        }

        private static bool VerifyPasswordHash(string password, byte[] localHash, byte[] localSalt)
        {
            if (password == null) throw new ArgumentNullException("password");
            if (string.IsNullOrWhiteSpace(password)) throw new ArgumentException("Value is empty", "password");
            if (localHash.Length != 64)
                throw new ArgumentException("Invalid length. Password hash expected 64 bytes.", "passwordHash");
            if (localSalt.Length != 128)
                throw new ArgumentException("Invalid length. Password salt expected 128 bytes.", "passwordHash");

            var hmac = new HMACSHA512(localSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            for (var i = 0; i < computedHash.Length; i++)
                if (computedHash[i] != localHash[i])
                    return false;

            return true;
        }
    }
}