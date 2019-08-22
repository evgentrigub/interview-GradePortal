using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using GradePortalAPI.Dtos;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models;
using GradePortalAPI.Models.Base;
using GradePortalAPI.Models.Interfaces;
using GradePortalAPI.Models.Interfaces.Base;
using GradePortalAPI.Services.Repositories;
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
                throw new AppException("Username or password is empty");

            var user = await _context.Users.SingleOrDefaultAsync(x => x.Username == username);
            if (user == null)
                throw new AppException("User not found. Username or password is incorrect");

            if (!VerifyPasswordHash(password, user.PasswordHash, user.PasswordSalt))
                throw new AppException("Username or password is incorrect");

            return new Result<User>(message: "Authenticate successful!", isSuccess: true, data: user);
        }

        /// <inheritdoc />
        public async Task<IResult<User>> Create(User user, string password)
        {
            if (string.IsNullOrWhiteSpace(password))
                throw new AppException("Password is empty!");

            if (_context.Users.Any(x => x.Username == user.Username))
                throw new AppException("Username has already created!");

            CreatePasswordHash(password, out var passwordHash, out var passwordSalt);

            user.PasswordSalt = passwordSalt;
            user.PasswordHash = passwordHash;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return new Result<User>(message: "Created successfully !", isSuccess: true, data: user);
        }

        /// <inheritdoc />
        public async Task<IResult<IList<User>>> GetUsersWithParams(TableParamsDto tableParams)
        {
            var users = await GetAll().Skip(tableParams.Skip()).Take(tableParams.Take()).ToListAsync();
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
                throw new AppException("Username is empty");

            var res = await _context.Users.SingleOrDefaultAsync(r => r.Username == username);
            return new Result<User>(message: "Success", isSuccess: true, data: res);
        }

        /// <inheritdoc />
        public IResult Update(string id, User user, string password = null)
        {
            if (id != user.Id)
                throw new AppException("User try update another profile!");

            var currentUser = _context.Users.Find(user.Id);

            if (currentUser == null)
                throw new AppException("User not found");


            if (user.Username != currentUser.Username && _context.Users.Any(x => x.Username == user.Username))
                throw new AppException("Username has already existed. Username:" + user.Username);

            currentUser.FirstName = user.FirstName;
            currentUser.LastName = user.LastName;
            currentUser.Username = user.Username;
            currentUser.City = user.City;
            currentUser.Position = user.Position;

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
            if (password == null) throw new ArgumentNullException("password");
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