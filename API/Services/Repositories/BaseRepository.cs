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

        public async Task<IResult<TEntity>> FindById(string id)
        {
            try
            {
                var entity = await Set.FindAsync(id);
                if(entity == null) 
                    return new Result<TEntity>(message:"Can not find entity with id:"+id, isSuccess:false, data:null);

                return new Result<TEntity>(message:"Success!", isSuccess:true, data:entity);
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
                var result = await FindById(id);
                if(!result.IsSuccess)
                    return new Result(result.Message, isSuccess:false);

                Set.Remove(result.Data);
                return new Result("Delete successful", true);
            }
            catch (AppException e)
            {
                throw new AppException("BaseRepository Delete Entity Error:" + e.Message);
            }
        }
    }
}