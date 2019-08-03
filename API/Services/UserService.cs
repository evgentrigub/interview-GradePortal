using System;
using System.Collections.Generic;
using System.Linq;
using API.Helpers;
using API.Models;
using API.Models.Interfaces;

namespace API.Services
{
    public class UserService : IUserService
    {
        private DataContext _context;

        public UserService(DataContext context)
        {
            this._context = context;
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
            if(string.IsNullOrWhiteSpace(password))
                throw new AppException("Password is incorrect");

            if (_context.Users.Any(x => x.Username == user.Username))
                throw new AppException("Username has already existed. Username: " + user.Username);

            CreatePasswordHash(password, out byte[] passwordHash, out byte[] passwordSalt );

            user.PasswordSalt = passwordSalt;
            user.PasswordHash = passwordHash;

            _context.Users.Add(user);
            _context.SaveChanges();

            return user;
        }

        public IEnumerable<User> GetAll()
        {
            return _context.Users;
        }

        public User GetById(int id)
        {
            return _context.Users.Find(id);
        }

        public void Update(User newUser, string password = null)
        {
            var user = _context.Users.Find(newUser.Id);

            if (user == null)
                throw new AppException("User not found");

            if (newUser.Username != user.Username)
            {
                if (_context.Users.Any(x => x.Username == newUser.Username))
                    throw new AppException("Username has already existed. Username:" + newUser.Username);
            }

            user.FirstName = newUser.FirstName;
            user.LastName = newUser.LastName;
            user.Username = newUser.Username;

            //if (!string.IsNullOrWhiteSpace(password))
            //{
            //    byte[] passwordHash, passwordSalt;
            //    CreatePasswordHash(password, out passwordHash, out passwordSalt);

            //    user.PasswordHash = passwordHash;
            //    user.PasswordSalt = passwordSalt;
            //}

            _context.Users.Update(user);
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

        private static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            if(password == null) throw new ArgumentNullException("password");
            if(string.IsNullOrWhiteSpace(password)) throw new ArgumentException("Value is empty", "password");

            var hmac = new System.Security.Cryptography.HMACSHA512();
            passwordSalt = hmac.Key;
            passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
        }

        private static bool VerifyPasswordHash(string password, byte[] localHash, byte[] localSalt)
        {
            if (password == null) throw new ArgumentNullException("password");
            if (string.IsNullOrWhiteSpace(password)) throw new ArgumentException("Value is empty", "password");
            if (localHash.Length != 64) throw new ArgumentException("Invalid length. Password hash expected 64 bytes.", "passwordHash");
            if (localSalt.Length != 128) throw new ArgumentException("Invalid length. Password salt expected 128 bytes.", "passwordHash");

            var hmac = new System.Security.Cryptography.HMACSHA512(localSalt);
            var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            for (int i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != localHash[i]) return false;
            }

            return true;
        }

    }
}
