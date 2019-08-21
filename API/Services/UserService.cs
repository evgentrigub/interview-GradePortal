using System;
using System.Collections.Generic;
using System.Data.Entity;
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

namespace GradePortalAPI.Services
{
    public class UserService : BaseRepository<User>, IUserService
    {
        private readonly DataContext _context;

        public UserService(DataContext context): base(context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IResult<User>> Authenticate(string username, string password)
        {
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
                return new Result<User>(message: "Username or password is empty", isSuccess:false, data:null);

            var user = await _context.Users.SingleOrDefaultAsync(x => x.Username == username);
            if (user == null)
                return new Result<User>(message: "User not found. Username or password is incorrect", isSuccess: false, data: null);

            if (!VerifyPasswordHash(password, user.PasswordHash, user.PasswordSalt))
                return new Result<User>(message: "Username or password is incorrect", isSuccess: false, data: null); ;
            return new Result<User>(message: "Authenticate successful!", isSuccess:true, data:user);
        }

        public IResult<User> Create(User user, string password)
        {
            if (string.IsNullOrWhiteSpace(password))
                return new Result<User>(message: "Password is empty!", isSuccess: true, data: null); ;

            if (_context.Users.Any(x => x.Username == user.Username))
                 return new Result<User>(message:"Username has already created!", isSuccess:true, data:null);;

            CreatePasswordHash(password, out var passwordHash, out var passwordSalt);

            user.PasswordSalt = passwordSalt;
            user.PasswordHash = passwordHash;

            _context.Users.Add(user);
            _context.SaveChanges();

            return new Result<User>(message:"Created successfully !", isSuccess:true, data:user);
        }

        public async Task<IResult<IList<User>>> GetAll(TableParamsDto tableParams)
        {
            var users = await _context.Users.Skip(tableParams.Skip()).Take(tableParams.Take()).ToListAsync();
            return new Result<IList<User>>(message: "Success", isSuccess:true, data:users);
        }

        public User GetById(string id)
        {
            return _context.Users.Find(id);
        }

        public async Task<IResult<User>> GetByUserName(string username)
        {
            var res = await _context.Users.SingleOrDefaultAsync(r => r.Username == username);
            return new Result<User>(message:"Success", isSuccess:true, data:res);
        }

        public IResult Update(string id, User user, string password = null)
        {
            if (id != user.Id)
                return new Result("User try update another profile!", isSuccess:false);

            var currentUser = _context.Users.Find(user.Id);

            if (currentUser == null)
                return new Result("User not found", isSuccess: false);


            if (user.Username != currentUser.Username)
                if (_context.Users.Any(x => x.Username == user.Username))
                    return new Result("Username has already existed. Username:" + user.Username, isSuccess: false);

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
            return new Result("Username has already existed. Username:" + user.Username, isSuccess: false);
        }

        public IResult Delete(int id)
        {
            var user = _context.Users.Find(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                _context.SaveChanges();
                return new Result("User deleted.", isSuccess:true);
            }
            return new Result(message:"User not found", isSuccess:false);
        }

        public int CountAllUsers()
        {
            return _context.Users.Count();
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