using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using GradePortalAPI.Dtos;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models;
using GradePortalAPI.Models.Interfaces;
using GradePortalAPI.Models.Interfaces.Base;
using Microsoft.AspNetCore.Mvc;

namespace GradePortalAPI.Controllers
{
    [Route("[controller]/[action]")]
    [ApiController]
    public class SkillsController : ControllerBase
    {
        private readonly IEvaluateService _evaluateService;
        private readonly IMapper _mapper;
        private readonly ISearchService _searchService;
        private readonly ISkillService _skillService;
        private readonly IUserService _userService;

        public SkillsController(
            ISkillService skillService,
            IUserService userService,
            IEvaluateService evaluateService,
            ISearchService searchService,
            IMapper mapper
        )
        {
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _evaluateService = evaluateService ?? throw new ArgumentNullException(nameof(userService));
            _skillService = skillService ?? throw new ArgumentNullException(nameof(skillService));
            _searchService = searchService ?? throw new ArgumentNullException(nameof(skillService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        [HttpGet("{username}")]
        public IActionResult GetSkills(string username, string expertId = null)
        {
            try
            {
                var user = _userService.GetByUserName(username);
                var skills = _skillService.GetUserSkills(user.Id);

                var skillsDto = skills.Select(skill => new SkillDto
                {
                    Id = skill.Id,
                    Name = skill.Name,
                    Description = skill.Description,
                    AverageEvaluate = _evaluateService.GetAverageEvaluate(skill.Id, user.Id),
                    ExpertEvaluate = expertId != null
                        ? _evaluateService.GetSkillValueByExpert(user.Id, skill.Id, expertId)
                        : 0
                });

                return Ok(skillsDto);
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }

        [HttpPost("{userId}")]
        public IActionResult CreateOrAddSkill(string userId, [FromBody] SkillDto skillDto)
        {
            var skill = _mapper.Map<Skill>(skillDto);
            try
            {
                var addedSkill = _skillService.AddOrCreateSkill(userId, skill);
                var sk = _mapper.Map<SkillDto>(addedSkill);

                return Ok(sk);
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }

        [HttpGet]
        public IActionResult Search(string query, CancellationToken cancellationToken, int limit = 10)
        {
            try
            {
                if (limit <= 0 || string.IsNullOrWhiteSpace(query) || query.Length < 3) return Ok(new List<Skill>());

                var list = _searchService.SkillSearch(query).Take(limit);

                return Ok(list.ToList());
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }

        [HttpGet]
        public async Task<IActionResult> Find(string id)
        {
            try
            {
                var res = await _skillService.FindById(id);
                return Ok(res);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var res = await _skillService.Delete(id);
                return Ok(res);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }
    }
}