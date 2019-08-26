using System;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using GradePortalAPI.Dtos;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models.Errors;
using GradePortalAPI.Models.Interfaces;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace GradePortalAPI.Controllers
{
    //[Authorize]
    [Route("[controller]/[action]")]
    [ApiController]
    public class EvaluationsController : ControllerBase
    {
        private readonly IEvaluateService _evaluateService;

        public EvaluationsController(
            IMapper mapper,
            IEvaluateService evaluateService
        )
        {
            _evaluateService = evaluateService ?? throw new ArgumentNullException(nameof(evaluateService));
        }

        /// <summary>
        /// </summary>
        /// <param name="evaluation"></param>
        /// <returns></returns>
        [HttpPost]
        [ProducesResponseType((int) HttpStatusCode.OK)]
        [ProducesResponseType((int) HttpStatusCode.BadRequest)]
        [ProducesResponseType((int) HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int) HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> Create([FromBody] EvaluateDto evaluation)
        {
            try
            {
                var res = await _evaluateService.Create(evaluation);
                if (res.IsSuccess == false)
                    return NotFound(new NotFoundCustomException(res.Message));
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
        [HttpDelete("{id}")]
        [ProducesResponseType((int) HttpStatusCode.OK)]
        [ProducesResponseType((int) HttpStatusCode.BadRequest)]
        [ProducesResponseType((int) HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int) HttpStatusCode.InternalServerError)]
        public IActionResult DeleteEvaluation(string id)
        {
            var res = _evaluateService.Delete(id);
            return Ok(res);
        }
    }
}