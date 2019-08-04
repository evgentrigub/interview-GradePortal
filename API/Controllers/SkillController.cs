using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GradePortalAPI.Models;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace GradePortalAPI.Controllers
{
    [Route("[controller]/[action]")]
    [ApiController]
    public class SkillController : ControllerBase
    {
        [HttpPost]
        public IActionResult AddSkill([FromBody]Skill skill)
        {
            return Ok();
        }

        [HttpPut("{id}")]
        public IActionResult UpdateSkill(int id, [FromBody]Skill skill)
        {
            return Ok();
        }
    }
}
