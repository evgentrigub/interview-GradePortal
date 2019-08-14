using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace GradePortalAPI.Migrations
{
    public partial class _1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                "Skills",
                table => new
                {
                    Id = table.Column<string>(),
                    IsActive = table.Column<bool>(),
                    CreatedDate = table.Column<DateTime>(),
                    Name = table.Column<string>(nullable: true),
                    Description = table.Column<string>(nullable: true)
                },
                constraints: table => { table.PrimaryKey("PK_Skills", x => x.Id); });

            migrationBuilder.CreateTable(
                "Users",
                table => new
                {
                    Id = table.Column<string>(),
                    IsActive = table.Column<bool>(),
                    CreatedDate = table.Column<DateTime>(),
                    FirstName = table.Column<string>(nullable: true),
                    LastName = table.Column<string>(nullable: true),
                    Username = table.Column<string>(nullable: true),
                    PasswordHash = table.Column<byte[]>(nullable: true),
                    PasswordSalt = table.Column<byte[]>(nullable: true)
                },
                constraints: table => { table.PrimaryKey("PK_Users", x => x.Id); });

            migrationBuilder.CreateTable(
                "Evaluations",
                table => new
                {
                    Id = table.Column<string>(),
                    IsActive = table.Column<bool>(),
                    CreatedDate = table.Column<DateTime>(),
                    UserId = table.Column<string>(nullable: true),
                    SkillId = table.Column<string>(nullable: true),
                    ExpertId = table.Column<string>(nullable: true),
                    Value = table.Column<int>()
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Evaluations", x => x.Id);
                    table.ForeignKey(
                        "FK_Evaluations_Users_ExpertId",
                        x => x.ExpertId,
                        "Users",
                        "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        "FK_Evaluations_Skills_SkillId",
                        x => x.SkillId,
                        "Skills",
                        "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        "FK_Evaluations_Users_UserId",
                        x => x.UserId,
                        "Users",
                        "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                "UserSkill",
                table => new
                {
                    UserId = table.Column<string>(),
                    SkillId = table.Column<string>()
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSkill", x => new {x.UserId, x.SkillId});
                    table.ForeignKey(
                        "FK_UserSkill_Skills_SkillId",
                        x => x.SkillId,
                        "Skills",
                        "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        "FK_UserSkill_Users_UserId",
                        x => x.UserId,
                        "Users",
                        "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                "IX_Evaluations_ExpertId",
                "Evaluations",
                "ExpertId");

            migrationBuilder.CreateIndex(
                "IX_Evaluations_SkillId",
                "Evaluations",
                "SkillId");

            migrationBuilder.CreateIndex(
                "IX_Evaluations_UserId",
                "Evaluations",
                "UserId");

            migrationBuilder.CreateIndex(
                "IX_UserSkill_SkillId",
                "UserSkill",
                "SkillId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                "Evaluations");

            migrationBuilder.DropTable(
                "UserSkill");

            migrationBuilder.DropTable(
                "Skills");

            migrationBuilder.DropTable(
                "Users");
        }
    }
}