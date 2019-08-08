using GradePortalAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace GradePortalAPI.Helpers
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Skill> Skills { get; set; }
        public DbSet<Evaluation> Evaluations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<UserSkill>()
                .HasKey(us => new {us.UserId, us.SkillId});

            modelBuilder.Entity<UserSkill>()
                .HasOne(x => x.User)
                .WithMany(x => x.UserSkills)
                .HasForeignKey(x => x.UserId);

            modelBuilder.Entity<UserSkill>()
                .HasOne(x => x.Skill)
                .WithMany(x => x.UserSkills)
                .HasForeignKey(x => x.SkillId);

            base.OnModelCreating(modelBuilder);
        }
    }
}