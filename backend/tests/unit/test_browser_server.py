"""The isolated test shutdown stays reachable when serving a frontend build."""

from types import SimpleNamespace

import httpx
import pytest

from tests import serve_auth_browser


@pytest.mark.anyio
async def test_shutdown_precedes_static_mount(monkeypatch, settings_factory, tmp_path):
    (tmp_path / "index.html").write_text("<h1>Test build</h1>", encoding="utf-8")
    settings = settings_factory(
        jwt_secret="test-only-secret-material-at-least-32-bytes", frontend_dist=tmp_path
    )
    monkeypatch.setattr(serve_auth_browser, "Settings", lambda: settings)
    app = serve_auth_browser.browser_test_app()
    app.state.test_server = SimpleNamespace(should_exit=False)
    # ASGITransport does not start lifespan here: this is a routing-only test,
    # without any Atlas connection or temporary collections.
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://testserver"
    ) as client:
        assert (await client.get("/")).status_code == 200
        assert (await client.post("/_test/shutdown")).status_code == 202
    assert app.state.test_server.should_exit
