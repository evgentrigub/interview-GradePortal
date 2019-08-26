using Microsoft.EntityFrameworkCore.Migrations;

namespace GradePortalAPI.Migrations
{
    public partial class _7 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                "QuickSearchCity",
                "Users",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                "QuickSearchPosition",
                "Users",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                "QuickSearchCity",
                "Users");

            migrationBuilder.DropColumn(
                "QuickSearchPosition",
                "Users");
        }
    }
}