using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models;
using GradePortalAPI.Models.Interfaces;
using GradePortalAPI.Models.ViewModels;
using GradePortalAPI.Services;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace GradePortalAPI.Controllers
{
    [Route("[controller]/[action]")]
    [ApiController]
    public class SkillsController : ControllerBase
    {
        private readonly ISkillService _skillService;

        public SkillsController(
            ISkillService skillService
            )
        {
            _skillService = skillService;
        }

        [HttpPost]
        public IActionResult AddSkill([FromBody] SkillViewModel skill)
        {
            try
            {
                _skillService.Create(skill);
                return Ok();
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }

        [HttpPut("{id}")]
        public IActionResult UpdateSkill(int id, [FromBody]Skill skill)
        {
            return Ok();
        }
    }
}
