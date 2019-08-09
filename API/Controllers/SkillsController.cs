using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using GradePortalAPI.Dtos;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models;
using GradePortalAPI.Models.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GradePortalAPI.Controllers
{
    [Route("[controller]/[action]")]
    [ApiController]
    public class SkillsController : ControllerBase
    {
        private readonly ISkillService _skillService;
        private readonly ISkillSearchService _searchService;
        private readonly IMapper _mapper;

        public SkillsController(
            ISkillService skillService,
            ISkillSearchService searchService,
            IMapper mapper
            )
        {
            _skillService = skillService ?? throw new ArgumentNullException(nameof(skillService));
            _searchService = searchService ?? throw new ArgumentNullException(nameof(skillService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        [HttpGet("{userId}")]
        public IActionResult GetUserSkills(string userId)
        {
            try
            {
                var skills = _skillService.GetUserSkills(userId);
                var skillsDto = _mapper.Map<IList<SkillDto>>(skills);
                return Ok(skillsDto);
            }
            catch (AppException e)
            {
                return BadRequest(new { message = e.Message });
            }
        }

        //[HttpPost("/{userId:string}")]
        [HttpPost]
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
                if (limit <= 0 || string.IsNullOrWhiteSpace(query) || query.Length < 3)
                {
                    return Ok(new List<Skill>());
                }

                var list = _searchService.Search(query).Take(limit);

                return Ok(list.ToList());
            }
            catch (AppException e)
            {
                return BadRequest(new { message = e.Message });
            }

        }
    }
}
