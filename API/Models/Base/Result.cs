using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GradePortalAPI.Models.Interfaces.Base;

namespace GradePortalAPI.Models.Base
{
    public class Result: IResult
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="Result"/> class.
        /// Конструктор.
        /// </summary>
        /// <param name="message">Сообщение.</param>
        /// <param name="isSuccess">Флаг успешности.</param>
        public Result(string message, bool isSuccess)
        {
            this.Message = message ?? throw new System.ArgumentNullException(nameof(message));
            this.IsSuccess = isSuccess;
        }
        public bool IsSuccess { get; }
        public string Message { get; }
    }

    public class Result<T>: IResult<T>
    {
        public Result(T data, string message, bool isSuccess)
        {
            this.Data = data;
            this.Message = message;
            this.IsSuccess = isSuccess;
        }
        public bool IsSuccess { get; }
        public string Message { get; }
        public T Data { get; }
    }
}
