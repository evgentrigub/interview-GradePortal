using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using AutoMapper;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using API.Dtos;
using API.Helpers;
using API.Models;
using API.Models.Interfaces;
using API.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace API.Controllers
{
    [Authorize]
    [Route("[controller]/[action]")]
    [ApiController]
    public class UsersController : ControllerBase
    {

        private IUserService _userService;
        private IMapper _mapper;
        private AppSettings _appSettings;

        public UsersController(
            IUserService userService,
            IMapper mapper,
            IOptions<AppSettings> appSettings
            )
        {
            _userService = userService;
            _mapper = mapper;
            _appSettings = appSettings.Value;
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult Authenticate([FromBody] UserDto userDto)
        {
            try
            {
                var user = _userService.Authenticate(userDto.Username, userDto.Password);
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_appSettings.Secret);
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.Name, user.Id.ToString())
                    }),
                    Expires = DateTime.UtcNow.AddDays(1),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };
                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenToSend = tokenHandler.WriteToken(token);

                return Ok(new UserAuthenticateModel()
                {
                    Id = user.Id,
                    Username = user.Username,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Token = tokenToSend
                });
            }
            catch (AppException e)
            {
                return BadRequest(new { message = e.Message });
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult Register([FromBody] UserDto userDto)
        {
            var user = _mapper.Map<User>(userDto);

            try
            {
                _userService.Create(user, userDto.Password);
                return Ok();
            }
            catch (AppException e)
            {
                return BadRequest(new { message = e.Message });
            }
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var users = _userService.GetAll();
            var userViewModels = _mapper.Map<IList<UserViewModel>>(users);
            return Ok(userViewModels);
        }

        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            var user = _userService.GetById(id);
            var userViewModel = _mapper.Map<UserViewModel>(user);
            return Ok(userViewModel);
        }

        [HttpPut("{id}")]
        public IActionResult Update([FromBody]UserDto userDto)
        {
            var user = _mapper.Map<User>(userDto);

            try
            {
                _userService.Update(user, userDto.Password);
                return Ok();
            }
            catch (AppException e)
            {
                return BadRequest(new { message = e.Message });
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _userService.Delete(id);
            return Ok();
        }
    }
}
