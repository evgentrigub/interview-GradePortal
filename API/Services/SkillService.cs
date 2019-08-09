using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models;
using GradePortalAPI.Models.Interfaces;

namespace GradePortalAPI.Services
{
    public class SkillService : ISkillService
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;

        public SkillService(DataContext context, IMapper mapper)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(context));
        }

        public IEnumerable<Skill> GetUserSkills(string userId)
        {
            var user = _context.Users.SingleOrDefault(u => u.Id == userId);
            if (user == null)
                throw new AppException("User not found");
            var skills = _context.Users
                .Where(u => u.Id == userId)
                .SelectMany(u => u.UserSkills)
                .Select(us => us.Skill).ToList();
            return skills;
        }

        public Skill AddOrCreateSkill(string userId, Skill skill)
        {
            var user = _context.Users.SingleOrDefault(u => u.Id == userId);
            if (user == null || skill == null)
                throw new AppException("User or Skill not found");

            if (string.IsNullOrEmpty(skill.Name) || string.IsNullOrEmpty(skill.Description))
                throw new AppException("Skill: Name or Description is empty");

            if (string.IsNullOrEmpty(skill.Id))
            {
                var newSkill = CreateNew(skill);
                return AddSkillToUser(user, newSkill);
            }

            return AddSkillToUser(user, skill);
        }

        private Skill CreateNew(Skill skill)
        {
            var newSkill = new Skill {Name = skill.Name, Description = skill.Description};

            _context.Skills.Add(newSkill);
            _context.SaveChanges();

            return newSkill;
        }

        private Skill AddSkillToUser(User user, Skill skill)
        {
            if (skill != null && user != null)
            {
                var userSkills = new UserSkill
                {
                    User = user,
                    Skill = skill
                };
                //user.UserSkills.Add(userSkills);
                //_context.Users.Update(user);
                skill.UserSkills.Add(userSkills);
                _context.Skills.Update(skill);
                _context.SaveChanges();
                return skill;
            }

            throw new AppException("User or Skill not found");
        }

        //public void Update(Skill skill)
        //{
        //    var currentSkill = GetById(skill.Id);
        //    currentSkill.Name = skill.Name;
        //    currentSkill.Description = skill.Description;
        //    _context.SaveChanges();
        //}

        //public Skill GetById(string id)
        //{
        //    var skill = _context.Skills.SingleOrDefault(r => r.Id == id);
        //    if (skill == null)
        //    {
        //        throw new AppException("The skill not found. Id:" + id);
        //    }
        //    return skill;
        //}
    }
}