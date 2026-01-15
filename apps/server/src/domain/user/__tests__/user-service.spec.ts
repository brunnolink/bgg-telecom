import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "../user-service";
import { AppError } from "../../../errors/AppError";

const hashMock = vi.fn();
const compareMock = vi.fn();
const signMock = vi.fn();

vi.mock("bcryptjs", () => ({
    default: {
        hash: (...args: any[]) => hashMock(...args),
        compare: (...args: any[]) => compareMock(...args),
    },
}));

vi.mock("../../../singletons/middleware/jwt", () => ({
    jwtSingleton: {
        sign: (...args: any[]) => signMock(...args),
    },
}));

function makeUserEntityStub(overrides?: Partial<any>) {
    return {
        id: "user-1",
        name: "Brunno",
        email: "brunno@.com",
        password: "123456",
        role: "CLIENT",
        toPublic: () => ({
            id: "user-1",
            name: "Brunno",
            email: "brunno@.com",
            role: "CLIENT",
        }),
        ...overrides,
    };
}

describe("UserService", () => {
    let repo: any;
    let service: UserService;

    beforeEach(() => {
        repo = {
            findByEmail: vi.fn(),
            findById: vi.fn(),
            create: vi.fn(),
            list: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        };

        service = new UserService(repo);

        hashMock.mockReset();
        compareMock.mockReset();
        signMock.mockReset();

        vi.clearAllMocks();
    });

    describe("create", () => {
        it("should create a username with a hashed password when an email address does not exist.", async () => {
            repo.findByEmail.mockResolvedValue(null);
            hashMock.mockResolvedValue("hashed123");
            repo.create.mockResolvedValue(makeUserEntityStub({ password: "hashed123" }));

            const input = {
                name: "Brunno",
                email: "brunno@.com",
                password: "123",
                role: "CLIENT",
            };

            const result = await service.create(input as any);

            expect(repo.findByEmail).toHaveBeenCalledWith(input.email);
            expect(hashMock).toHaveBeenCalledWith(input.password, 10);
            expect(repo.create).toHaveBeenCalledTimes(1);

            const createdArg = repo.create.mock.calls[0][0];
            expect(createdArg.name).toBe(input.name);
            expect(createdArg.email).toBe(input.email);
            expect(createdArg.role).toBe(input.role);
            expect(createdArg.password).toBe("hashed123");

            expect(result.password).toBe("hashed123");
        });

        it("should throw an AppError 400 if email is already in use.", async () => {
            repo.findByEmail.mockResolvedValue(makeUserEntityStub());

            await expect(
                service.create({ name: "x", email: "brunno@.com", password: "123", role: "CLIENT" } as any)
            ).rejects.toBeInstanceOf(AppError);

            await expect(
                service.create({ name: "x", email: "brunno@.com", password: "123", role: "CLIENT" } as any)
            ).rejects.toMatchObject({ message: "The email is already in use", statusCode: 400 });

            expect(repo.create).not.toHaveBeenCalled();
            expect(hashMock).not.toHaveBeenCalled();
        });
    });

    describe("login", () => {
        it("should throw an error if the user does not exist.", async () => {
            repo.findByEmail.mockResolvedValue(null);

            await expect(service.login("x@x.com", "123")).rejects.toMatchObject({
                message: "Invalid credentials",
            });

            expect(compareMock).not.toHaveBeenCalled();
            expect(signMock).not.toHaveBeenCalled();
        });

        it("should throw an error if the password is incorrect.", async () => {
            const user = makeUserEntityStub({ password: "hashed_pw" });
            repo.findByEmail.mockResolvedValue(user);
            compareMock.mockResolvedValue(false);

            await expect(service.login(user.email, "wrong")).rejects.toMatchObject({
                message: "Invalid password",
            });

            expect(compareMock).toHaveBeenCalledTimes(1);
            expect(compareMock).toHaveBeenCalledWith("wrong", "hashed_pw");
            expect(signMock).not.toHaveBeenCalled();
        });

        it("should return a token + public username when the credentials are valid.", async () => {
            const user = makeUserEntityStub({ role: "TECH", password: "123456" });
            repo.findByEmail.mockResolvedValue(user);
            compareMock.mockResolvedValue(true);
            signMock.mockReturnValue("token-abc");

            const result = await service.login(user.email, "123");

            expect(compareMock).toHaveBeenCalledWith("123", "123456");
            expect(signMock).toHaveBeenCalledTimes(1);
            expect(signMock).toHaveBeenCalledWith({ sub: user.id, role: user.role });

            expect(result).toEqual({
                token: "token-abc",
                user: user.toPublic(),
            });
        });
    });

    describe("getUserById", () => {
        it("should return the user if they exist.", async () => {
            const user = makeUserEntityStub();
            repo.findById.mockResolvedValue(user);

            const result = await service.getUserById("user-1");
            expect(result).toBe(user);
        });

        it("should throw an AppError 404 if it doesn't exist.", async () => {
            repo.findById.mockResolvedValue(null);

            await expect(service.getUserById("x")).rejects.toMatchObject({
                message: "User not found",
                statusCode: 404,
            });
        });
    });

    describe("update", () => {
        it("should throw a 404 error if the user does not exist.", async () => {
            repo.findById.mockResolvedValue(null);

            await expect(service.updateUserInfo("x", { name: "a" } as any)).rejects.toMatchObject({
                message: "User not found",
                statusCode: 404,
            });

            expect(repo.update).not.toHaveBeenCalled();
        });

        it("should call repo.update if the user exists.", async () => {
            repo.findById.mockResolvedValue(makeUserEntityStub());
            repo.update.mockResolvedValue(makeUserEntityStub({ name: "Novo" }));

            const result = await service.updateUserInfo("user-1", { name: "Novo" } as any);

            expect(repo.update).toHaveBeenCalledWith("user-1", { name: "Novo" });
            expect(result.name).toBe("Novo");
        });
    });
});
