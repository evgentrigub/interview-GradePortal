using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using AutoMapper;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models.Enums;
using GradePortalAPI.Models.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GradePortalAPI.Controllers
{
    [Route("[controller]/[action]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly ISearchService _searchService;

        public SearchController(
            ISearchService searchService,
            IMapper mapper
        )
        {
            _searchService = searchService ?? throw new ArgumentNullException(nameof(searchService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        [HttpGet]
        public IActionResult ParamSearch(string query, SearchGroup group, CancellationToken cancellationToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query) || query.Length < 3) return Ok(new List<string>());

                var list = _searchService.ParamSearch(query, group);

                return Ok(list.ToList());
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }
    }
}