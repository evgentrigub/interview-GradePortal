using System;
using AutoMapper;
using GradePortalAPI.Dtos;
using GradePortalAPI.Models.Interfaces;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace GradePortalAPI.Controllers
{
    [Route("[controller]/[action]")]
    [ApiController]
    public class EvaluationsController : ControllerBase
    {
        private readonly IEvaluateService _evaluateService;

        private readonly IMapper _mapper;

        public EvaluationsController(
            IMapper mapper,
            IEvaluateService evaluateService
        )
        {
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _evaluateService = evaluateService ?? throw new ArgumentNullException(nameof(evaluateService));
        }

        [HttpPost]
        public IActionResult Create([FromBody] EvaluateDto evaluation)
        {
            var res = _evaluateService.Create(evaluation);
            return Ok(res);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteEvaluation(string id)
        {
            var res = _evaluateService.Delete(id);
            return Ok(res);
        }
    }
}