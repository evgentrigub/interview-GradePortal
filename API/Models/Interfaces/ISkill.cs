﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage;

namespace GradePortalAPI.Models.Interfaces
{
    interface ISkill: IModelBase
    {
        string Name { get; set; }
        string Description { get; set; }
    }
}
