namespace GradePortalAPI.Dtos
{
    public class SkillDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public double AverageEvaluate { get; set; }
        public int ExpertEvaluate { get; set; }
    }
}