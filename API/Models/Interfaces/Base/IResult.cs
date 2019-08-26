namespace GradePortalAPI.Models.Interfaces.Base
{
    /// <summary>
    ///     Result of operation
    /// </summary>
    public interface IResult
    {
        /// <summary>
        ///     Gets a value indicating whether success flag.
        /// </summary>
        bool IsSuccess { get; }

        /// <summary>
        ///     Gets message.
        /// </summary>
        string Message { get; }
    }

    /// <summary>
    ///     Result of performance of operation with paramether.
    /// </summary>
    /// <typeparam name="T">Payload type.</typeparam>
    public interface IResult<T> : IResult
    {
        /// <summary>
        ///     Gets result payload.
        /// </summary>
        T Data { get; }
    }
}