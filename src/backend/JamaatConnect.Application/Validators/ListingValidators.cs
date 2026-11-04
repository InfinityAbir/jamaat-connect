using FluentValidation;
using JamaatConnect.Application.DTOs;

namespace JamaatConnect.Application.Validators
{
    public class CreateListingRequestValidator : AbstractValidator<CreateListingRequest>
    {
        public CreateListingRequestValidator()
        {
            RuleFor(x => x.DepartureLocationId)
                .NotEmpty().WithMessage("Departure location is required");

            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required")
                .MaximumLength(200).WithMessage("Title must not exceed 200 characters");

            RuleFor(x => x.Description)
                .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters");

            RuleFor(x => x.DateStatus)
                .NotEmpty().WithMessage("Date status is required")
                .Must(s => s == "Confirmed" || s == "Undecided")
                .WithMessage("Date status must be 'Confirmed' or 'Undecided'");

            RuleFor(x => x.DepartureAt)
                .Must((req, dt) =>
                {
                    if (req.DateStatus == "Confirmed")
                        return dt.HasValue && dt.Value >= DateTime.UtcNow.Date;
                    return !dt.HasValue || dt.Value >= DateTime.UtcNow.Date;
                })
                .When(x => x.DepartureAt.HasValue)
                .WithMessage("Departure date must be in the future for confirmed dates");

            RuleFor(x => x.DurationDays)
                .GreaterThan(0).WithMessage("Duration must be positive")
                .LessThanOrEqualTo(365).WithMessage("Duration cannot exceed 365 days")
                .When(x => x.DurationDays.HasValue);

            RuleFor(x => x.AvailabilityStatus)
                .NotEmpty().WithMessage("Availability status is required")
                .Must(s => new[] { "Available", "Limited", "Full" }.Contains(s))
                .WithMessage("Availability must be 'Available', 'Limited', or 'Full'");

            RuleFor(x => x.SubmitterName)
                .NotEmpty().WithMessage("Submitter name is required")
                .MaximumLength(100).WithMessage("Submitter name must not exceed 100 characters");

            RuleFor(x => x.SubmitterPhone)
                .NotEmpty().WithMessage("Submitter phone is required")
                .Matches(@"^[\+]?[\d\s\-\(\)]{7,20}$").WithMessage("Invalid phone number format");

            RuleFor(x => x.SubmitterEmail)
                .EmailAddress().WithMessage("Invalid email format")
                .When(x => !string.IsNullOrEmpty(x.SubmitterEmail));

            RuleFor(x => x.PreferredContactMethod)
                .NotEmpty().WithMessage("Preferred contact method is required")
                .Must(m => new[] { "Phone", "WhatsApp", "Email" }.Contains(m))
                .WithMessage("Preferred contact method must be 'Phone', 'WhatsApp', or 'Email'");

            RuleFor(x => x.WhatsAppNumber)
                .Matches(@"^[\+]?[\d\s\-\(\)]{7,20}$").WithMessage("Invalid WhatsApp number format")
                .When(x => !string.IsNullOrEmpty(x.WhatsAppNumber));
        }
    }

    public class UpdateListingRequestValidator : AbstractValidator<UpdateListingRequest>
    {
        public UpdateListingRequestValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required")
                .MaximumLength(200).WithMessage("Title must not exceed 200 characters");

            RuleFor(x => x.Description)
                .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters");

            RuleFor(x => x.DateStatus)
                .NotEmpty().WithMessage("Date status is required")
                .Must(s => s == "Confirmed" || s == "Undecided")
                .WithMessage("Date status must be 'Confirmed' or 'Undecided'");

            RuleFor(x => x.DepartureAt)
                .Must((req, dt) =>
                {
                    if (req.DateStatus == "Confirmed")
                        return dt.HasValue && dt.Value >= DateTime.UtcNow.Date;
                    return !dt.HasValue || dt.Value >= DateTime.UtcNow.Date;
                })
                .When(x => x.DepartureAt.HasValue)
                .WithMessage("Departure date must be in the future for confirmed dates");

            RuleFor(x => x.DurationDays)
                .GreaterThan(0).WithMessage("Duration must be positive")
                .LessThanOrEqualTo(365).WithMessage("Duration cannot exceed 365 days")
                .When(x => x.DurationDays.HasValue);

            RuleFor(x => x.AvailabilityStatus)
                .NotEmpty().WithMessage("Availability status is required")
                .Must(s => new[] { "Available", "Limited", "Full" }.Contains(s))
                .WithMessage("Availability must be 'Available', 'Limited', or 'Full'");
        }
    }

    public class ListingSearchRequestValidator : AbstractValidator<ListingSearchRequest>
    {
        public ListingSearchRequestValidator()
        {
            RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
            RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
            RuleFor(x => x.SortBy).Must(s => new[] { "departureAt", "createdAt", "title" }.Contains(s))
                .When(x => !string.IsNullOrEmpty(x.SortBy))
                .WithMessage("Invalid sort field");
            RuleFor(x => x.SortDirection).Must(s => new[] { "asc", "desc" }.Contains(s))
                .When(x => !string.IsNullOrEmpty(x.SortDirection))
                .WithMessage("Sort direction must be 'asc' or 'desc'");
        }
    }
}