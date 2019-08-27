using System;
using System.Collections.Generic;
using System.Net;
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

namespace GradePortalAPI.Controllers
{
    [Route("[controller]/[action]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IUserService _userService;

        public UsersController(
            IUserService userService,
            IMapper mapper
        )
        {
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
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
        [ProducesResponseType((int) HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> Authenticate([FromBody] UserAuthDto userDto)
        {
            try
            {
                var result = await _userService.Authenticate(userDto.Username, userDto.Password);
                if (!result.IsSuccess)
                    return NotFound(new NotFoundCustomException(result.Message));

                var token = _userService.CreateToken(result.Data.Id);
                var user = _mapper.Map<UserAuthenticateModel>(result.Data);
                user.Token = token;

                return Accepted(new Result<UserAuthenticateModel>(message: "Authenticate successful!", isSuccess: true,
                    data: user));
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
        [ProducesResponseType((int) HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> Register([FromBody] UserDto userDto)
        {
            var user = _mapper.Map<User>(userDto);

            try
            {
                var result = await _userService.Create(user, userDto.Password);
                if (!result.IsSuccess)
                    return BadRequest(new BadRequestCustomException(result.Message));

                return Created("", result);
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
        [ProducesResponseType((int) HttpStatusCode.InternalServerError)]
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
                return BadRequest(new {message = e.Message});
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
        [ProducesResponseType((int) HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> GetUser(string username)
        {
            try
            {
                var result = await _userService.GetByUserName(username);
                if (!result.IsSuccess)
                    return BadRequest(new BadRequestCustomException(result.Message));
                var userViewModel = _mapper.Map<UserViewModel>(result.Data);
                return Ok(new Result<UserViewModel>(message: result.Message, isSuccess: result.IsSuccess,
                    data: userViewModel));
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
                var result = _userService.Update(id, user);
                if (!result.IsSuccess)
                    return BadRequest(new BadRequestCustomException(result.Message));
                return Ok(result);
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
        /// <response code="200">Returns registered user</response>
        /// <response code="400">If error while deleting</response>
        [Authorize]
        [HttpDelete("{id}")]
        [ProducesResponseType((int) HttpStatusCode.OK)]
        [ProducesResponseType((int) HttpStatusCode.BadRequest)]
        [ProducesResponseType((int) HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int) HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var result = await _userService.Delete(id);
                if (!result.IsSuccess)
                    return BadRequest(new BadRequestCustomException(result.Message));
                return Ok(result);
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }
    }
}