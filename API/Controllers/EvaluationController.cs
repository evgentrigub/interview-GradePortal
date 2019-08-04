using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GradePortalAPI.Models;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace GradePortalAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class EvaluationController : ControllerBase
    {
        [HttpPost]
        public void AddEvaluation([FromBody] Evaluation evaluation)
        {
        }

        [HttpDelete("{id}")]
        public void DeleteEvaluation(int id)
        {
        }
    }
}
