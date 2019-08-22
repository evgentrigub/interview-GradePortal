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
                throw new AppException("User, Expert or Skill not found.");

            var userSkill = user.UserSkills.Where(r => r.SkillId == skill.Id);
            if (userSkill == null)
                throw new AppException("Skill not found. Username: " + user.Username + ", skill: " +
                                       skill.Name);

            var newEvaluate = new Evaluation
            {
                Expert = expert,
                Skill = skill,
                User = user,
                Value = evaluateDto.Value
            };

            _context.Evaluations.Add(newEvaluate);
            _context.SaveChanges();

            return new Result("Success", true);
        }

        /// <inheritdoc />
        public double GetAverageEvaluate(string skillId, string userId)
        {
            var evaluations = _context.Evaluations
                .Where(r => r.Skill.Id == skillId && r.User.Id == userId)
                .Select(r => r.Value);

            if (evaluations.Sum() == 0) throw new AppException("Evaluations not found");

            double a = evaluations.Sum();
            double b = evaluations.Count();
            return a / b;
        }

        /// <inheritdoc />
        public int GetSkillValueByExpert(string userId, string skillId, string expertId)
        {
            var evaluation = _context.Evaluations.SingleOrDefault(r =>
                r.User.Id == userId && r.Expert.Id == expertId && r.Skill.Id == skillId);
            if (evaluation == null)
                throw new AppException("Evaluation not found");

            return evaluation.Value;
        }
    }
}