using FluentValidation;
using JamaatConnect.Application.DTOs;

namespace JamaatConnect.Application.Validators
{
    public class CreateEnquiryRequestValidator : AbstractValidator<CreateEnquiryRequest>
    {
        public CreateEnquiryRequestValidator()
        {
            RuleFor(x => x.ListingId)
                .NotEmpty().WithMessage("Listing ID is required");

            RuleFor(x => x.SenderName)
                .NotEmpty().WithMessage("Sender name is required")
                .MaximumLength(100).WithMessage("Sender name must not exceed 100 characters");

            RuleFor(x => x.SenderPhone)
                .Matches(@"^[\+]?[\d\s\-\(\)]{7,20}$").WithMessage("Invalid phone number format")
                .When(x => !string.IsNullOrEmpty(x.SenderPhone));

            RuleFor(x => x.SenderWhatsApp)
                .Matches(@"^[\+]?[\d\s\-\(\)]{7,20}$").WithMessage("Invalid WhatsApp number format")
                .When(x => !string.IsNullOrEmpty(x.SenderWhatsApp));

            RuleFor(x => x.Message)
                .NotEmpty().WithMessage("Message is required")
                .MaximumLength(1000).WithMessage("Message must not exceed 1000 characters");
        }
    }

    public class EnquirySearchRequestValidator : AbstractValidator<EnquirySearchRequest>
    {
        public EnquirySearchRequestValidator()
        {
            RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
            RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
        }
    }

    public class EnquiryModerationActionValidator : AbstractValidator<EnquiryModerationAction>
    {
        public EnquiryModerationActionValidator()
        {
            RuleFor(x => x.EnquiryId)
                .NotEmpty().WithMessage("Enquiry ID is required");

            RuleFor(x => x.Action)
                .NotEmpty().WithMessage("Action is required")
                .Must(a => new[] { "MarkContacted", "MarkJunk", "Archive" }.Contains(a))
                .WithMessage("Invalid action. Must be 'MarkContacted', 'MarkJunk', or 'Archive'");

            RuleFor(x => x.Reason)
                .MaximumLength(1000).WithMessage("Reason must not exceed 1000 characters")
                .When(x => !string.IsNullOrEmpty(x.Reason));
        }
    }
}