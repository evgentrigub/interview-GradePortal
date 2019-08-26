using System;
using System.Threading.Tasks;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models.Base;
using GradePortalAPI.Models.Interfaces.Base;
using Microsoft.EntityFrameworkCore;

namespace GradePortalAPI.Services.Repositories
{
    public class BaseRepository<TEntity> : IBaseRepository<TEntity>
        where TEntity : class
    {
        private readonly DataContext _context;

        public BaseRepository(DataContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            Set = _context.Set<TEntity>();
        }

        protected virtual DbSet<TEntity> Set { get; }

        public async Task<TEntity> FindById(string id)
        {
            return await Set.FindAsync(id);
        }

        public async Task<IResult> Delete(string id)
        {
            var entity = await FindById(id);
            Set.Remove(entity);

            return new Result("Delete successful", true);
        }
    }
}