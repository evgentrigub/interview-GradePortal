using System;
using AutoMapper;
using GradePortalAPI.Dtos;
using GradePortalAPI.Models;
using GradePortalAPI.Models.ViewModels;

namespace GradePortalAPI.Helpers
{
    public class AppSettings
    {
        public string Secret { get; set; }
    }

    public class AppException : Exception
    {
        public AppException(string message) : base(message)
        {
        }
    }

    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<User, UserAuthenticateModel>();
            CreateMap<UserAuthenticateModel, User>();
            CreateMap<User, UserDto>();
            CreateMap<UserDto, User>();
            CreateMap<User, UserViewModel>();
            CreateMap<UserViewModel, User>();
            CreateMap<SkillDto, Skill>();
            CreateMap<Skill, SkillDto>();
        }
    }
}