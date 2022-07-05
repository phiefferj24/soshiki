export async function get() {
    return {
      headers: { Location: '/browse' },
      status: 302
    }
}
  