using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using GradePortalAPI.Dtos;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models;
using GradePortalAPI.Models.Interfaces;
using GradePortalAPI.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace GradePortalAPI.Controllers
{
    //[Authorize]
    [Route("[controller]/[action]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppSettings _appSettings;
        private readonly IEvaluateService _evaluateService;
        private readonly IMapper _mapper;
        private readonly ISkillService _skillService;
        private readonly IUserService _userService;

        public UsersController(
            IUserService userService,
            IMapper mapper,
            IOptions<AppSettings> appSettings,
            ISkillService skillService,
            IEvaluateService evaluateService
        )
        {
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _skillService = skillService ?? throw new ArgumentNullException(nameof(userService));
            _evaluateService = evaluateService ?? throw new ArgumentNullException(nameof(userService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _appSettings = appSettings.Value ?? throw new ArgumentNullException(nameof(appSettings));
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult Authenticate([FromBody] UserAuthDto userAuthDto)
        {
            try
            {
                var user = _userService.Authenticate(userAuthDto.Username, userAuthDto.Password);
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_appSettings.Secret);
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.Name, user.Id)
                    }),
                    Expires = DateTime.UtcNow.AddDays(1),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                        SecurityAlgorithms.HmacSha256Signature)
                };
                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenToSend = tokenHandler.WriteToken(token);

                return Ok(new UserAuthenticateModel
                {
                    Id = user.Id,
                    Username = user.Username,
                    Token = tokenToSend
                });
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult Register([FromBody] UserAuthDto userAuthDto)
        {
            var user = _mapper.Map<User>(userAuthDto);

            try
            {
                var res = _userService.Create(user, userAuthDto.Password);
                return Ok(res);
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }

        [HttpPost]
        public IActionResult GetAll([FromBody] TableParamsDto tableParams)
        {
            var users = _userService.GetAll(tableParams);
            var usersView = _mapper.Map<IEnumerable<UserViewModel>>(users);

            var userTableData = new UserDataTable
            {
                Items = usersView,
                TotalCount = _userService.CountAllUsers()
            };

            return Ok(userTableData);
        }

        [HttpGet("{username}")]
        public IActionResult GetUser(string username)
        {
            var user = _userService.GetByUserName(username);
            var userViewModel = _mapper.Map<UserViewModel>(user);
            return Ok(userViewModel);
        }


        [HttpGet("{id}")]
        public IActionResult Get(string id)
        {
            var user = _userService.GetById(id);
            var userViewModel = _mapper.Map<UserViewModel>(user);
            return Ok(userViewModel);
        }

        [HttpPut("{id}")]
        public IActionResult Update(string id, [FromBody] UserAuthDto userAuthDto)
        {
            var user = _mapper.Map<User>(userAuthDto);

            try
            {
                _userService.Update(id, user, userAuthDto.Password);
                return Ok();
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _userService.Delete(id);
            return Ok();
        }

        //[HttpPost]
        //public IActionResult AddUserSkill(string id, Skill skill)
        //{
        //    var user = _userService.GetById(id);
        //    var isExisted = _userService.IsExisted(skill);
        //    return Ok();
        //}
    }
}