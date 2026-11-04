namespace JamaatConnect.Application.Common
{
    public class Result<T>
    {
        public bool IsSuccess { get; }
        public T? Value { get; }
        public string? Error { get; }
        public string? ErrorCode { get; }

        protected Result(bool isSuccess, T? value, string? error, string? errorCode)
        {
            IsSuccess = isSuccess;
            Value = value;
            Error = error;
            ErrorCode = errorCode;
        }

        public static Result<T> Success(T value) => new(true, value, null, null);
        public static Result<T> Failure(string error, string? errorCode = null) => new(false, default, error, errorCode);

        public static Result<T> NotFound(string? message = null) => Failure(message ?? "Resource not found", "NOT_FOUND");
        public static Result<T> Unauthorized(string? message = null) => Failure(message ?? "Unauthorized", "UNAUTHORIZED");
        public static Result<T> Forbidden(string? message = null) => Failure(message ?? "Forbidden", "FORBIDDEN");
        public static Result<T> ValidationFailed(string? message = null) => Failure(message ?? "Validation failed", "VALIDATION_ERROR");
        public static Result<T> Conflict(string? message = null) => Failure(message ?? "Conflict", "CONFLICT");
    }

    public class Result
    {
        public bool IsSuccess { get; }
        public string? Error { get; }
        public string? ErrorCode { get; }

        protected Result(bool isSuccess, string? error, string? errorCode)
        {
            IsSuccess = isSuccess;
            Error = error;
            ErrorCode = errorCode;
        }

        public static Result Success() => new(true, null, null);
        public static Result Failure(string error, string? errorCode = null) => new(false, error, errorCode);
        public static Result NotFound(string? message = null) => Failure(message ?? "Resource not found", "NOT_FOUND");
        public static Result Unauthorized(string? message = null) => Failure(message ?? "Unauthorized", "UNAUTHORIZED");
        public static Result Forbidden(string? message = null) => Failure(message ?? "Forbidden", "FORBIDDEN");
        public static Result ValidationFailed(string? message = null) => Failure(message ?? "Validation failed", "VALIDATION_ERROR");
        public static Result Conflict(string? message = null) => Failure(message ?? "Conflict", "CONFLICT");
    }

    public interface IDateTimeProvider
    {
        DateTime UtcNow { get; }
        DateOnly Today => DateOnly.FromDateTime(UtcNow);
    }

    public interface ICurrentUserService
    {
        Guid? UserId { get; }
        string? Email { get; }
        string? DisplayName { get; }
        bool IsAuthenticated { get; }
        bool IsInRole(string role);
        IReadOnlyCollection<string> Roles { get; }
    }
}