using Microsoft.EntityFrameworkCore.Migrations;

namespace GradePortalAPI.Migrations
{
    public partial class _7 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "QuickSearchCity",
                table: "Users",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "QuickSearchPosition",
                table: "Users",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "QuickSearchCity",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "QuickSearchPosition",
                table: "Users");
        }
    }
}
