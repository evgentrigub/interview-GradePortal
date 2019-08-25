using System;
using System.Collections.Generic;
using System.Data.Entity.Core.Metadata.Edm;
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
using GradePortalAPI.Models.Errors;
using GradePortalAPI.Models.Interfaces;
using GradePortalAPI.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.VisualStudio.Web.CodeGeneration.Contracts.Messaging;
using Newtonsoft.Json;

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
        /// </summary>
        /// <param name="userDto"></param>
        /// <returns></returns>
        /// <response code="202">Returns authenticated user</response>
        /// <response code="400">If something wrong with authenticate</response>
        [HttpPost]
        [ProducesResponseType((int) HttpStatusCode.Accepted)]
        [ProducesResponseType((int) HttpStatusCode.BadRequest)]
        public async Task<IActionResult> Authenticate([FromBody] UserAuthDto userDto)
        {
            try
            {
                var res = await _userService.Authenticate(userDto.Username, userDto.Password);
                if (res.IsSuccess == false)
                    return NotFound(new NotFoundCustomException(res.Message));

                // вынести токен в отдельный метод в сервисе
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

                var user = _mapper.Map<UserAuthenticateModel>(res.Data);
                user.Token = tokenToSend;

                return Accepted(new Result<UserAuthenticateModel>(message: "Authenticate successful!", isSuccess: true, data: user));
            }
            catch (AppException exception)
            {
                return BadRequest(new {exception.Message});
            }
        }


        /// <summary>
        /// </summary>
        /// <param name="userDto"></param>
        /// <returns></returns>
        /// <response code="201">Returns registered user</response>
        /// <response code="400">If username exist or password null</response>
        [HttpPost]
        [ProducesResponseType((int) HttpStatusCode.Created)]
        [ProducesResponseType((int) HttpStatusCode.BadRequest)]
        public async Task<IActionResult> Register([FromBody] UserDto userDto)
        {
            var user = _mapper.Map<User>(userDto);

            try
            {
                var res = await _userService.Create(user, userDto.Password);
                if (res.IsSuccess == false)
                    return BadRequest(new BadRequestCustomException(res.Message));

                return Created("", res);
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }

        /// <summary>
        /// </summary>
        /// <param name="tableParams"></param>
        /// <returns></returns>
        /// <response code="200">Returns users per page in table</response>
        /// <response code="400">If error while getting users</response>
        [HttpGet]
        [ProducesResponseType((int) HttpStatusCode.OK)]
        [ProducesResponseType((int) HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetUsers([FromQuery] TableParamsDto tableParams)
        {
            try
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
            catch (AppException e)
            {
                return BadRequest(new { message = e.Message });
            }
        }

        /// <summary>
        ///     Get user info by username
        /// </summary>
        /// <param name="username"></param>
        /// <returns></returns>
        /// <response code="200">Returns user</response>
        /// <response code="400">If username is empty</response>
        [HttpGet("{username}")]
        [ProducesResponseType((int) HttpStatusCode.OK)]
        [ProducesResponseType((int) HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetUser(string username)
        {
            try
            {
                var result = await _userService.GetByUserName(username);
                if (result.IsSuccess == false)
                    return BadRequest(new BadRequestCustomException(result.Message));
                var userViewModel = _mapper.Map<UserViewModel>(result.Data);
                return Ok(new Result<UserViewModel>(message: result.Message, isSuccess:result.IsSuccess, data: userViewModel));
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }

        /// <summary>
        /// </summary>
        /// <param name="id"></param>
        /// <param name="userDto"></param>
        /// <returns></returns>
        /// <response code="200">Updated successful</response>
        /// <response code="400">If error while updating</response>
        [Authorize]
        [HttpPut("{id}")]
        [ProducesResponseType((int) HttpStatusCode.OK)]
        [ProducesResponseType((int) HttpStatusCode.BadRequest)]
        [ProducesResponseType((int) HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int) HttpStatusCode.InternalServerError)]
        public IActionResult Update(string id, [FromBody] UserDto userDto)
        {
            var user = _mapper.Map<User>(userDto);

            try
            {
                var res = _userService.Update(id, user, userDto.Password);
                if (res.IsSuccess == false)
                    return BadRequest(new BadRequestCustomException(res.Message));
                return Ok(res);
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }

        /// <summary>
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <response code="204">Returns registered user</response>
        /// <response code="400">If error while deleting</response>
        [Authorize]
        [HttpDelete("{id}")]
        [ProducesResponseType((int) HttpStatusCode.NoContent)]
        [ProducesResponseType((int) HttpStatusCode.BadRequest)]
        [ProducesResponseType((int) HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int) HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                await _userService.Delete(id);
                return NoContent();
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }
    }
}