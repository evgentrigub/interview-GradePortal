using System;
using AutoMapper;
using GradePortalAPI.Dtos;
using GradePortalAPI.Models.Interfaces;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace GradePortalAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class EvaluationController : ControllerBase
    {
        private readonly IEvaluateService _evaluateService;

        private readonly IMapper _mapper;

        public EvaluationController(
            IMapper mapper,
            IEvaluateService evaluateService
        )
        {
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _evaluateService = evaluateService ?? throw new ArgumentNullException(nameof(evaluateService));
        }

        [HttpPost]
        public bool Create([FromBody] EvaluateDto evaluation)
        {
            var res = _evaluateService.Create(evaluation);
            return res;
        }

        [HttpDelete("{id}")]
        public bool DeleteEvaluation(string id)
        {
            var res = _evaluateService.Delete(id);
            return res;
        }
    }
}