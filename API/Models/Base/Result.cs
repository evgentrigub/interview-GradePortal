using System;
using System.Runtime.InteropServices;
using GradePortalAPI.Models.Interfaces.Base;
using JetBrains.Annotations;

namespace GradePortalAPI.Models.Base
{
    public class Result : IResult
    {
        /// <summary>
        ///     Initializes a new instance of the <see cref="Result" /> class.
        ///     Конструктор.
        /// </summary>
        /// <param name="message">Сообщение.</param>
        /// <param name="isSuccess">Флаг успешности.</param>
        public Result(string message, bool isSuccess)
        {
            Message = message;
            IsSuccess = isSuccess;
        }

        public bool IsSuccess { get; }
        public string Message { get; }
        public string Description { get; set; }
        public int? HttpErrorCode { get; set; }
    }

    public class Result<T> : IResult<T>
    {
        public Result(T data, string message, bool isSuccess, [CanBeNull] string description = "", int code = 0)
        {
            Data = data;
            Message = message;
            Description = description;
            IsSuccess = isSuccess;
            HttpErrorCode = code;
        }

        public bool IsSuccess { get; }
        public string Message { get; }
        [CanBeNull] public string Description { get; set; }
        public int? HttpErrorCode { get; set; }
        public T Data { get; }
    }
}