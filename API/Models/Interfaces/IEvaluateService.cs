using System.Threading.Tasks;
using GradePortalAPI.Dtos;
using GradePortalAPI.Models.Interfaces.Base;

namespace GradePortalAPI.Models.Interfaces
{
    public interface IEvaluateService: IBaseRepository<Evaluation>
    {
        /// <summary>
        /// Create new evaluation
        /// </summary>
        /// <param name="evaluateDto"></param>
        /// <returns></returns>
        Task<IResult> Create(EvaluateDto evaluateDto);

        /// <summary>
        /// Get average evaluation value of all experts
        /// </summary>
        /// <param name="skillId"></param>
        /// <param name="userId"></param>
        /// <returns></returns>
        double GetAverageEvaluate(string skillId, string userId);

        /// <summary>
        /// Get evaluation value of skill by expert
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="skillId"></param>
        /// <param name="expertId"></param>
        /// <returns></returns>
        int GetSkillValueByExpert(string userId, string skillId, string expertId);
    }
}