using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using GradePortalAPI.Dtos;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models;
using GradePortalAPI.Models.Interfaces;

namespace GradePortalAPI.Services
{
    public class UserService : IUserService
    {
        private readonly DataContext _context;

        public UserService(DataContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public User Authenticate(string username, string password)
        {
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
                throw new AppException("Username or password is empty");

            var user = _context.Users.SingleOrDefault(x => x.Username == username);
            if (user == null)
                throw new AppException("User not found. Username or password is incorrect");

            if (!VerifyPasswordHash(password, user.PasswordHash, user.PasswordSalt)) return null;
            return user;
        }

        public User Create(User user, string password)
        {
            if (string.IsNullOrWhiteSpace(password))
                throw new AppException("Password is incorrect");

            if (_context.Users.Any(x => x.Username == user.Username))
                throw new AppException("Username has already existed. Username: " + user.Username);

            CreatePasswordHash(password, out var passwordHash, out var passwordSalt);

            user.PasswordSalt = passwordSalt;
            user.PasswordHash = passwordHash;

            _context.Users.Add(user);
            _context.SaveChanges();

            return user;
        }

        public IEnumerable<User> GetAll(TableParamsDto tableParams)
        {
            var users = _context.Users.Skip(tableParams.Skip()).Take(tableParams.Take());

            return users;
        }

        public User GetById(string id)
        {
            return _context.Users.Find(id);
        }

        public User GetByUserName(string username)
        {
            return _context.Users.SingleOrDefault(r => r.Username == username);
        }

        public void Update(string id, User user, string password = null)
        {
            if (id != user.Id)
                throw new AppException("User try update another profile!");

            var currentUser = _context.Users.Find(user.Id);

            if (currentUser == null)
                throw new AppException("User not found");

            if (user.Username != currentUser.Username)
                if (_context.Users.Any(x => x.Username == user.Username))
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
        }

        public void Delete(int id)
        {
            var user = _context.Users.Find(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                _context.SaveChanges();
            }
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