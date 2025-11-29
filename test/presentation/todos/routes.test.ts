import request from "supertest";
import { testServer } from "../../test-server";
import { prisma } from "../../../src/data/postgres";

const todo1 = { text: "Test todo 1" };
const todo2 = { text: "Test todo 2", completedAt: new Date("07/12/2025") };

describe("Todo route testing", () => {
  beforeAll(async () => {
    await testServer.start();
  });

  afterAll(() => {
    testServer.close();
  });

  beforeEach(async () => {
    await prisma.todo.deleteMany();
  });

  test("Should return TODOs api/todos", async () => {
    await prisma.todo.createMany({
      data: [todo1, todo2],
    });

    const { body } = await request(testServer.app)
      .get("/api/todos")
      .expect(200);

    expect(body).toBeInstanceOf(Array);
    expect(body.length).toBe(2);
    expect(body[0].text).toBe(todo1.text);
    expect(body[1].text).toBe(todo2.text);
    expect(body[0].completedAt).toBeNull();
    expect(new Date(body[1].completedAt)).toEqual(todo2.completedAt);
  });

  test("Should return TODO api/todos/:id", async () => {
    const todo = await prisma.todo.create({
      data: todo1,
    });

    const { body } = await request(testServer.app)
      .get(`/api/todos/${todo.id}`)
      .expect(200);

    expect(body).toEqual({
      id: todo.id,
      text: todo.text,
      completedAt: todo.completedAt,
    });
  });

  test("Should return a 404 NotFound api/todos/:id", async () => {
    const id = 999;
    const { body } = await request(testServer.app)
      .get(`/api/todos/${id}`)
      .expect(404);

    expect(body).toEqual({ error: `todo with id ${id} not found` });
  });

  test("Should return a todo if is created api/todos", async () => {
    const { body } = await request(testServer.app)
      .post(`/api/todos`)
      .send(todo1)
      .expect(201);

    expect(body).toEqual({
      id: expect.any(Number),
      text: todo1.text,
      completedAt: null,
    });
  });

  test("Should return an error if text is not send api/todos", async () => {
    const { body } = await request(testServer.app)
      .post(`/api/todos`)
      .send({})
      .expect(400);

    expect(body).toEqual({ error: expect.any(String) });
  });

  test("Should return an error if text is empty api/todos", async () => {
    const { body } = await request(testServer.app)
      .post(`/api/todos`)
      .send({ text: "" })
      .expect(400);

    expect(body).toEqual({ error: expect.any(String) });
  });

  test("Should return an updated todo api/todos", async () => {
    const todo = await prisma.todo.create({
      data: todo1,
    });

    const { body } = await request(testServer.app)
      .put(`/api/todos/${todo.id}`)
      .send({ text: "Test Update", completedAt: "2025/07/12" })
      .expect(200);

    expect(body).toEqual({
      id: expect.any(Number),
      text: "Test Update",
      completedAt: "2025-07-12T06:00:00.000Z",
    });
  });

  test("Should return an error 404 if id not found", async () => {
    const todo = await prisma.todo.create({
      data: todo1,
    });
    const id = 999;

    const { body } = await request(testServer.app)
      .put(`/api/todos/${id}`)
      .send({ text: "Test Update", completedAt: "2025/07/12" })
      .expect(404);

    expect(body).toEqual({ error: expect.any(String) });
  });

  test("Should return a todo with only text updated", async () => {
    const todo = await prisma.todo.create({
      data: todo1,
    });

    const { body } = await request(testServer.app)
      .put(`/api/todos/${todo.id}`)
      .send({ text: "Test Update" })
      .expect(200);

    expect(body).toEqual({
      id: expect.any(Number),
      text: "Test Update",
      completedAt: todo.completedAt,
    });
  });

  test("Should return a todo with only completedAt updated", async () => {
    const todo = await prisma.todo.create({
      data: todo1,
    });

    const { body } = await request(testServer.app)
      .put(`/api/todos/${todo.id}`)
      .send({ completedAt: "2025/07/12" })
      .expect(200);

    expect(body).toEqual({
      id: expect.any(Number),
      text: todo.text,
      completedAt: "2025-07-12T06:00:00.000Z",
    });
  });

  test("Should delete a todo api/todos/:id", async () => {
    const todo = await prisma.todo.create({
      data: todo1,
    });

    const { body } = await request(testServer.app)
      .delete(`/api/todos/${todo.id}`)
      .expect(200);

    expect(body).toEqual({
      id: expect.any(Number),
      text: todo.text,
      completedAt: null,
    });
  });

  test("Should return 404 if id todo not found api/todos/:id", async () => {
    const id = 999;
    const { body } = await request(testServer.app)
      .delete(`/api/todos/${id}`)
      .expect(404);

    expect(body).toEqual({ error: expect.any(String) });
  });
});
