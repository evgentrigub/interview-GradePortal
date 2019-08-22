using System;
using System.Net;
using AutoMapper;
using GradePortalAPI.Dtos;
using GradePortalAPI.Models.Interfaces;
using Microsoft.AspNetCore.Authorization;
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
        /// 
        /// </summary>
        /// <param name="evaluation"></param>
        /// <returns></returns>
        [HttpPost]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int)HttpStatusCode.InternalServerError)]
        public IActionResult Create([FromBody] EvaluateDto evaluation)
        {
            var res = _evaluateService.Create(evaluation);
            return Ok(res);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("{id}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int)HttpStatusCode.InternalServerError)]
        public IActionResult DeleteEvaluation(string id)
        {
            var res = _evaluateService.Delete(id);
            return Ok(res);
        }
    }
}