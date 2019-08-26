using Microsoft.EntityFrameworkCore.Migrations;

namespace GradePortalAPI.Migrations
{
    public partial class _5 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                "QuickSearchName",
                "Users",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                "QuickSearch",
                "Skills",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                "QuickSearchName",
                "Users");

            migrationBuilder.DropColumn(
                "QuickSearch",
                "Skills");
        }
    }
}