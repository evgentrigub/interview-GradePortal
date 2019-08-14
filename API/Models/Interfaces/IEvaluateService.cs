using GradePortalAPI.Dtos;

namespace GradePortalAPI.Models.Interfaces
{
    public interface IEvaluateService
    {
        Evaluation Get(string evaluateId);
        bool Create(EvaluateDto evaluateDto);
        bool Delete(string evaluateId);
        double GetAverageEvaluate(string skillId, string userId);
        int GetSkillValueByExpert(string userId, string skillId, string expertId);
    }
}