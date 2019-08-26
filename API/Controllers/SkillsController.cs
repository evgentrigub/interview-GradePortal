using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using GradePortalAPI.Dtos;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models;
using GradePortalAPI.Models.Base;
using GradePortalAPI.Models.Errors;
using GradePortalAPI.Models.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradePortalAPI.Controllers
{
    //[Authorize]
    [Route("[controller]/[action]")]
    [ApiController]
    public class SkillsController : ControllerBase
    {
        private readonly IEvaluateService _evaluateService;
        private readonly IMapper _mapper;
        private readonly ISkillService _skillService;
        private readonly IUserService _userService;

        public SkillsController(
            ISkillService skillService,
            IUserService userService,
            IEvaluateService evaluateService,
            IMapper mapper
        )
        {
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _skillService = skillService ?? throw new ArgumentNullException(nameof(skillService));
            _evaluateService = evaluateService ?? throw new ArgumentNullException(nameof(userService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        /// <summary>
        /// </summary>
        /// <param name="username"></param>
        /// <param name="expertId"></param>
        /// <returns></returns>
        [AllowAnonymous]
        [HttpGet("{username}")]
        [ProducesResponseType((int) HttpStatusCode.OK)]
        [ProducesResponseType((int) HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetSkills(string username, string expertId = null)
        {
            var userResult = await _userService.GetByUserName(username);
            var skillsResult = await _skillService.GetUserSkills(userResult.Data.Id);
            if (!userResult.IsSuccess || !skillsResult.IsSuccess)
                return NotFound(new NotFoundCustomException(userResult.Message));

            try
            {
                var skillsDto = skillsResult.Data.Select(skill => new SkillDto
                {
                    Id = skill.Id,
                    Name = skill.Name,
                    Description = skill.Description,
                    AverageEvaluate = _evaluateService.GetAverageEvaluate(skill.Id, userResult.Data.Id),
                    ExpertEvaluate = expertId != null
                        ? _evaluateService.GetSkillValueByExpert(userResult.Data.Id, skill.Id, expertId)
                        : 0
                });

                return Ok(new Result<IEnumerable<SkillDto>>(message:skillsResult.Message, isSuccess:skillsResult.IsSuccess, data:skillsDto));
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }

        /// <summary>
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="skillDto"></param>
        /// <returns></returns>
        [HttpPost("{userId}")]
        [ProducesResponseType((int) HttpStatusCode.OK)]
        [ProducesResponseType((int) HttpStatusCode.BadRequest)]
        [ProducesResponseType((int) HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int) HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> CreateOrAddSkill(string userId, [FromBody] SkillDto skillDto)
        {
            var skill = _mapper.Map<Skill>(skillDto);

            var result = await _skillService.CreateOrAddSkill(userId, skill);
            if (result.IsSuccess == false)
                return BadRequest(new BadRequestCustomException(result.Message));

            var sk = _mapper.Map<SkillDto>(result.Data);
            return Ok(new Result<SkillDto>(message: result.Message, isSuccess:result.IsSuccess, data:sk));
        }

        /// <summary>
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        [ProducesResponseType((int) HttpStatusCode.OK)]
        [ProducesResponseType((int) HttpStatusCode.BadRequest)]
        [ProducesResponseType((int) HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int) HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> Find(string id)
        {
            try
            {
                var result = await _skillService.FindById(id);
                var sk = _mapper.Map<SkillDto>(result);
                return Ok(new Result<SkillDto>(message:"Success", isSuccess: true, data:sk));
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
        [HttpDelete("{id}")]
        [ProducesResponseType((int) HttpStatusCode.OK)]
        [ProducesResponseType((int) HttpStatusCode.BadRequest)]
        [ProducesResponseType((int) HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int) HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var res = await _skillService.Delete(id);
                return Ok(res);
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }
    }
}