using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using AutoMapper;
using GradePortalAPI.Dtos;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models.Enums;
using GradePortalAPI.Models.Interfaces;
using GradePortalAPI.Models.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace GradePortalAPI.Controllers
{
    [Route("[controller]/[action]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly ISearchService _searchService;
        private readonly IUserService _userService;

        public SearchController(
            ISearchService searchService,
            IUserService userService,
            IMapper mapper
        )
        {
            _searchService = searchService ?? throw new ArgumentNullException(nameof(searchService));
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        [HttpGet]
        public IActionResult ParamSearch(string query, SearchGroup group, CancellationToken cancellationToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query) || query.Length < 3) return Ok(new List<string>());

                var list = _searchService.ParamSearch(query, group);

                return Ok(list);
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }

        [HttpGet]
        public IActionResult UsersSearch([FromQuery] SearchOptionsDto filters)
        {
            try
            {
                var data = _searchService.UsersSearch(filters.Filters, filters.Skip(), filters.Take());

                return Ok(data);
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }
    }
}