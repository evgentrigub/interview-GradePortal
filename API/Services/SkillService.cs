using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Threading.Tasks;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models;
using GradePortalAPI.Models.Interfaces;
using GradePortalAPI.Models.ViewModels;

namespace GradePortalAPI.Services
{
    public class SkillService: ISkillService
    {
        private readonly DataContext _context;
        public SkillService(DataContext context)
        {
            this._context = context ?? throw new System.ArgumentNullException(nameof(context));
        }
        public Skill Create(SkillViewModel skill)
        {
            if (string.IsNullOrEmpty(skill.Name) || string.IsNullOrEmpty(skill.Description))
                throw new AppException("Name or Description is empty");

            var newSkill = new Skill {Name = skill.Name, Description = skill.Description};

            _context.Skills.Add(newSkill);
            _context.SaveChanges();

            return newSkill;
        }

        public void Update(Skill skill)
        {
            throw new NotImplementedException();
        }
    }
}
