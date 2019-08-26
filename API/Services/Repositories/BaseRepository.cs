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
            try
            {
                return await Set.FindAsync(id);
            }
            catch (AppException e)
            {
                throw new AppException("BaseRepository Find Entity Error:" + e.Message);
            }
        }

        public async Task<IResult> Delete(string id)
        {
            try
            {
                var entity = await FindById(id);
                Set.Remove(entity);

                return new Result("Delete successful", true);
            }
            catch (AppException e)
            {
                throw new AppException("BaseRepository Delete Entity Error:" + e.Message);
            }
        }
    }
}