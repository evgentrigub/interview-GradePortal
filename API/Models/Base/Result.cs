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
    }

    public class Result<T> : IResult<T>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="Result{T}"/> class.
        /// </summary>
        /// <param name="data">The data.</param>
        /// <param name="message">The message.</param>
        /// <param name="isSuccess">if set to <c>true</c> [is success].</param>
        /// <param name="description">The description.</param>
        /// <param name="code">The code.</param>
        public Result(T data, string message, bool isSuccess)
        {
            Data = data;
            Message = message;
            IsSuccess = isSuccess;
        }

        public bool IsSuccess { get; }
        public string Message { get; }
        public T Data { get; }
    }
}