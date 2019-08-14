using System;
using System.Linq;
using GradePortalAPI.Dtos;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models;
using GradePortalAPI.Models.Interfaces;

namespace GradePortalAPI.Services
{
    public class EvaluateService : IEvaluateService
    {
        private readonly DataContext _context;

        public EvaluateService(DataContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public Evaluation Get(string evaluateId)
        {
            return _context.Evaluations.Find(evaluateId);
        }

        public bool Create(EvaluateDto evaluateDto)
        {
            var expert = _context.Users.Find(evaluateDto.ExpertId);
            var user = _context.Users.Find(evaluateDto.UserId);
            var skill = _context.Skills.Find(evaluateDto.SkillId);

            if (expert == null || user == null || skill == null)
                throw new AppException("User, Expert or Skill not found. Username: " + user + ", skill: " + skill +
                                       ", expert:");

            var userSkill = user.UserSkills.Where(r => r.SkillId == skill.Id);
            if (userSkill == null)
                throw new AppException("Can't find evaluated skill. Username: " + user.Username + ", skill: " +
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

            return true;
        }

        public bool Delete(string evaluateId)
        {
            var evaluate = _context.Evaluations.Find(evaluateId);
            if (evaluate != null)
            {
                _context.Evaluations.Remove(evaluate);
                _context.SaveChanges();

                return true;
            }

            throw new AppException("Evaluate not found");
        }

        public double GetAverageEvaluate(string skillId, string userId)
        {
            var evaluations = _context.Evaluations.Where(r => r.Skill.Id == skillId && r.User.Id == userId)
                .Select(r => r.Value);
            if (evaluations.Count() != 0)
            {
                double a = evaluations.Sum();
                double b = evaluations.Count();
                return a / b;
            }

            return 0;
        }

        public int GetSkillValueByExpert(string userId, string skillId, string expertId)
        {
            var evaluation = _context.Evaluations.SingleOrDefault(r =>
                r.User.Id == userId && r.Expert.Id == expertId && r.Skill.Id == skillId);
            if (evaluation != null) return evaluation.Value;

            return 0;
        }
    }
}