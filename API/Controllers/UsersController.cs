using System;
using System.Collections;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using GradePortalAPI.Dtos;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models;
using GradePortalAPI.Models.Base;
using GradePortalAPI.Models.Interfaces;
using GradePortalAPI.Models.Interfaces.Base;
using GradePortalAPI.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace GradePortalAPI.Controllers
{
    [Route("[controller]/[action]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppSettings _appSettings;
        private readonly IMapper _mapper;
        private readonly IUserService _userService;

        public UsersController(
            IUserService userService,
            IMapper mapper,
            IOptions<AppSettings> appSettings
        )
        {
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _appSettings = appSettings.Value ?? throw new ArgumentNullException(nameof(appSettings));
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="userDto"></param>
        /// <returns></returns>
        /// <response code="202">Returns authenticated user</response>
        /// <response code="400">If something wrong with authenticate</response>
        [HttpPost]
        [ProducesResponseType((int) HttpStatusCode.Accepted)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> Authenticate([FromBody] UserAuthDto userDto)
        {
            try
            {
                var res = await _userService.Authenticate(userDto.Username, userDto.Password);
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_appSettings.Secret);
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.Name, res.Data.Id)
                    }),
                    Expires = DateTime.UtcNow.AddDays(1),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                        SecurityAlgorithms.HmacSha256Signature)
                };
                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenToSend = tokenHandler.WriteToken(token);

                var user = new UserAuthenticateModel
                {
                    Id = res.Data.Id,
                    Username = res.Data.Username,
                    Token = tokenToSend
                };

                return Ok(new Result<User>(message: "Authenticate successful!", isSuccess: true, data: res.Data));
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="userDto"></param>
        /// <returns></returns>
        /// <response code="201">Returns registered user</response>
        /// <response code="400">If username exist or password null</response>
        [HttpPost]
        [ProducesResponseType((int)HttpStatusCode.Created)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> Register([FromBody] UserDto userDto)
        {
            var user = _mapper.Map<User>(userDto);

            try
            {
                var res = await _userService.Create(user, userDto.Password);
                return Ok(res);
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="tableParams"></param>
        /// <returns></returns>
        /// <response code="200">Returns users per page in table</response>
        /// <response code="400">If error while getting users</response>
        [HttpGet]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetUsers([FromQuery] TableParamsDto tableParams)
        {
            var result = await _userService.GetUsersWithParams(tableParams);
            var userTableData = new UserDataTable
            {
                Items = _mapper.Map<IList<UserViewModel>>(result.Data),
                TotalCount = _userService.CountAllUsers()
            };
            var res = new Result<UserDataTable>(
                message: result.Message, isSuccess: result.IsSuccess, data: userTableData);

            return Ok(res);
        }

        /// <summary>
        /// Get user info by username
        /// </summary>
        /// <param name="username"></param>
        /// <returns></returns>
        /// <response code="200">Returns registered user</response>
        /// <response code="400">If username is empty</response>
        [HttpGet("{username}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public IActionResult GetUser(string username)
        {
            try
            {
                var user = _userService.GetByUserName(username);
                var userViewModel = _mapper.Map<UserViewModel>(user);
                return Ok(userViewModel);
            }
            catch (AppException e)
            {
                return BadRequest(new { message = e.Message });
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <param name="userDto"></param>
        /// <returns></returns>
        /// <response code="204">Returns registered user</response>
        /// <response code="400">If error while updating</response>
        [Authorize]
        [HttpPut("{id}")]
        [ProducesResponseType((int)HttpStatusCode.NoContent)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int)HttpStatusCode.InternalServerError)]
        public IActionResult Update(string id, [FromBody] UserDto userDto)
        {
            var user = _mapper.Map<User>(userDto);

            try
            {
                var res = _userService.Update(id, user, userDto.Password);
                return Ok(res);
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <response code="204">Returns registered user</response>
        /// <response code="400">If error while deleting</response>
        [Authorize]
        [HttpDelete("{id}")]
        [ProducesResponseType((int)HttpStatusCode.NoContent)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var res = await _userService.Delete(id);
                return Ok(res);
            }
            catch (AppException e)
            {
                return BadRequest(new { message = e.Message });
            }
        }
    }
}