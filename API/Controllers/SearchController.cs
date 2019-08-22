using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using GradePortalAPI.Dtos;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models;
using GradePortalAPI.Models.Enums;
using GradePortalAPI.Models.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradePortalAPI.Controllers
{
    [Route("[controller]/[action]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _searchService;

        public SearchController(
            ISearchService searchService
        )
        {
            _searchService = searchService ?? throw new ArgumentNullException(nameof(searchService));
        }

        /// <summary>
        /// </summary>
        /// <param name="query"></param>
        /// <param name="cancellationToken"></param>
        /// <param name="limit"></param>
        /// <returns></returns>
        [Authorize]
        [HttpGet]
        [ProducesResponseType((int) HttpStatusCode.OK)]
        [ProducesResponseType((int) HttpStatusCode.BadRequest)]
        [ProducesResponseType((int) HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int) HttpStatusCode.InternalServerError)]
        public IActionResult SearchSkills(string query, CancellationToken cancellationToken, int limit = 10)
        {
            try
            {
                if (limit <= 0 || string.IsNullOrWhiteSpace(query) || query.Length < 3) return Ok(new List<Skill>());

                var list = _searchService.SkillSearch(query).Take(limit);

                return Ok(list);
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }

        /// <summary>
        /// </summary>
        /// <param name="query"></param>
        /// <param name="group"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        [HttpGet]
        [ProducesResponseType((int) HttpStatusCode.OK)]
        [ProducesResponseType((int) HttpStatusCode.BadRequest)]
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

        /// <summary>
        /// </summary>
        /// <param name="options"></param>
        /// <returns></returns>
        [HttpGet]
        [ProducesResponseType((int) HttpStatusCode.OK)]
        [ProducesResponseType((int) HttpStatusCode.BadRequest)]
        public IActionResult UsersSearch([FromQuery] SearchOptionsDto options)
        {
            try
            {
                var data = _searchService.UsersSearch(options.Filters, options.Skip(), options.Take());

                return Ok(data);
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }
    }
}