using System;
using System.Linq;
using System.Threading.Tasks;
using GradePortalAPI.Dtos;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models;
using GradePortalAPI.Models.Base;
using GradePortalAPI.Models.Interfaces;
using GradePortalAPI.Models.Interfaces.Base;
using GradePortalAPI.Services.Repositories;

namespace GradePortalAPI.Services
{
    public class EvaluateService : BaseRepository<Evaluation>, IEvaluateService
    {
        private readonly DataContext _context;
        private readonly ISkillService _skillService;
        private readonly IUserService _userService;

        public EvaluateService(
            DataContext context,
            ISkillService skillService,
            IUserService userService
        ) : base(context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _skillService = skillService ?? throw new ArgumentNullException(nameof(skillService));
        }

        /// <inheritdoc />
        public async Task<IResult> Create(EvaluateDto evaluateDto)
        {
            var expert = await _userService.FindById(evaluateDto.ExpertId);
            var user = await _userService.FindById(evaluateDto.UserId);
            var skill = await _skillService.FindById(evaluateDto.SkillId);

            if (expert == null || user == null || skill == null)
                return new Result("User, Expert or Skill not found.", false);

            var userSkill = user.UserSkills.Where(r => r.SkillId == skill.Id);
            if (userSkill == null)
                throw new AppException("Skill not found. Username: " +
                                       user.Username + ", skill: " + skill.Name);
            var newEvaluate = new Evaluation
            {
                Expert = expert,
                Skill = skill,
                User = user,
                Value = evaluateDto.Value
            };

            try
            {
                _context.Evaluations.Add(newEvaluate);
                await _context.SaveChangesAsync();
            }
            catch (AppException e)
            {
                throw new AppException("Add evaluate error. Evaluate by " +
                                       newEvaluate.Expert.Username + " to " + newEvaluate.User.Username
                                       + ". Error: " + e.Message);
            }

            return new Result("Success", true);
        }

        /// <inheritdoc />
        public double GetAverageEvaluate(string skillId, string userId)
        {
            try
            {
                var evaluations = _context.Evaluations
                    .Where(r => r.Skill.Id == skillId && r.User.Id == userId)
                    .Select(r => r.Value);

                if (evaluations.Count() == 0)
                    return 0;

                double a = evaluations.Sum();
                double b = evaluations.Count();
                return a / b;
            }
            catch (AppException e)
            {
                throw new AppException("GetAverageEvaluate Error: " + e.Message);
            }
        }

        /// <inheritdoc />
        public int GetSkillValueByExpert(string userId, string skillId, string expertId)
        {
            try
            {
                var evaluations = _context.Evaluations.Where(r =>
                    r.User.Id == userId && r.Expert.Id == expertId && r.Skill.Id == skillId);

                if (evaluations.Count() >= 2)
                    throw new AppException("Evaluations count more 1, found" + evaluations.Count());

                if (!evaluations.Any())
                    return 0;
                var evaluation = evaluations.FirstOrDefault();
                if (evaluation == null)
                    throw new AppException("Evaluation is null");

                return evaluation.Value;
            }
            catch (AppException e)
            {
                throw new AppException("GetSkillValueByExpert Error: " + e.Message);
            }
        }
    }
}