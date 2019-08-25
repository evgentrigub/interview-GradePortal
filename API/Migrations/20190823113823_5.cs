using Microsoft.EntityFrameworkCore.Migrations;

namespace GradePortalAPI.Migrations
{
    public partial class _5 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "QuickSearchName",
                table: "Users",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "QuickSearch",
                table: "Skills",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "QuickSearchName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "QuickSearch",
                table: "Skills");
        }
    }
}
