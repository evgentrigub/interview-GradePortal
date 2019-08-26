using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models;
using GradePortalAPI.Models.Base;
using GradePortalAPI.Models.Interfaces;
using GradePortalAPI.Models.Interfaces.Base;
using GradePortalAPI.Services.Repositories;
using Microsoft.EntityFrameworkCore;

namespace GradePortalAPI.Services
{
    public class SkillService : BaseRepository<Skill>, ISkillService
    {
        private readonly DataContext _context;
        private readonly IUserService _userService;

        public SkillService(DataContext context, IUserService userService) : base(context)
        {
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        /// <inheritdoc />
        public async Task<IResult<IList<Skill>>> GetUserSkills(string userId)
        {
            var user = _context.Users.SingleOrDefault(u => u.Id == userId);
            if (user == null)
                return new Result<IList<Skill>>(message: "User not found. UserId: " + userId, isSuccess: false,
                    data: null);

            var skills = await _userService.GetAll()
                .Where(u => u.Id == userId)
                .SelectMany(u => u.UserSkills)
                .Select(us => us.Skill).ToListAsync();
            return new Result<IList<Skill>>(message: "Success!", isSuccess: true, data: skills);
        }

        /// <inheritdoc />
        public async Task<IResult<Skill>> CreateOrAddSkill(string userId, Skill skill)
        {
            var user = _context.Users.Include(r => r.UserSkills).SingleOrDefault(u => u.Id == userId);
            if (user == null || skill == null)
                return new Result<Skill>(message: "User or Skill not found", isSuccess: false, data: null);

            if (string.IsNullOrEmpty(skill.Name) || string.IsNullOrEmpty(skill.Description))
                return new Result<Skill>(message: "Skill Name or Description is empty", isSuccess: false, data: null);

            try
            {
                if (string.IsNullOrEmpty(skill.Id))
                {
                    var newSkill = await CreateNew(skill);
                    var sk = await AddSkillToUser(user, newSkill);
                    return new Result<Skill>(
                        message: "Skill " + newSkill.Name + " has created and added to your collection",
                        isSuccess: true, data: sk);
                }

                var addedSkill = await AddSkillToUser(user, skill);
                return new Result<Skill>(message: "Skill " + skill.Name + " added to your collection",
                    isSuccess: true, data: addedSkill);
            }
            catch (AppException e)
            {
                throw new AppException(e.Message);
            }


        }

        /// <summary>
        ///     Create new skill
        /// </summary>
        /// <param name="skill"></param>
        /// <returns></returns>
        private async Task<Skill> CreateNew(Skill skill)
        {
            var newSkill = new Skill {Name = skill.Name, Description = skill.Description};
            newSkill.QuickSearch = newSkill.Name.ToUpperInvariant() + newSkill.Description.ToUpperInvariant() +
                                   newSkill.Name.ToUpperInvariant();
            try
            {
                _context.Skills.Add(newSkill);

                await _context.SaveChangesAsync();

                return newSkill;
            }
            catch (AppException e)
            {
                throw new AppException("Create skill Error:" + e.Message);
            }
        }

        /// <summary>
        ///     Add skill to user collection
        /// </summary>
        /// <param name="user"></param>
        /// <param name="skill"></param>
        /// <returns></returns>
        private async Task<Skill> AddSkillToUser(User user, Skill skill)
        {
            if (skill == null || user == null)
                throw new AppException("Add skill to user. Error: User or Skill is null");

            try
            {
                var userSkills = new UserSkill
                {
                    User = user,
                    Skill = skill
                };

                var existedSkill = user.UserSkills.SingleOrDefault(r => r.UserId == user.Id && r.SkillId == skill.Id);
                if (existedSkill != null)
                    throw new AppException("You have already have skill " + skill.Name + " in your collection");

                skill.UserSkills.Add(userSkills);
                _context.Skills.Update(skill);
                await _context.SaveChangesAsync();
                return skill;
            }
            catch (AppException e)
            {
                throw new AppException("Add skill to user. Error: " + e.Message);
            }
        }
    }
}