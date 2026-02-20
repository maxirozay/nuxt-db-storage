export default defineTask({
  meta: {
    name: "test",
    description: "Run test",
  },
  run({ payload, context }) {
    console.log("test");
    return { result: "Success" };
  },
});
